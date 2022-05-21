var approvals = new GlideRecord('sysapproval_approver');
approvals.addQuery('source_table', 'change_request');  // Approvals related to the change table.
approvals.addQuery('state','requested');  // Approvals that are pending.
// Encoded queries can be used if you are feeling lazy.
approvals.orderBy('sysapproval');  // Sort based on the referenced task ticket.
// approvals.addEncodedQuery('source_table=change_request^state=requested');
approvals.query();

// Initializing some variables that will help with processing.
// I use dictionaries because I like to call each key pair by name.
// You can do something similiar with a list, but you will just need to memorize the index number.
// My answer data structure will look like this:
// {
//    'number': 'CHG#######',
//    'count': 2,
//    'approvers': ['Ann', 'Bob']
// }
var answer = {
    number: '',
    count: 0,
    approvers: []
};
var msg = '';

// The data that we get from the GlideRecord query comes in the form of a link list.
// .next() will fetch the next record and will return false if there are no more records to process.
while (approvals.next()) {
    // New set of approvals.
    if (approvals.sysapproval.number.toString() != answer.number) {
        // Don't print the answer if nothing is stored. This only applies for the first loop.
        if (answer.count != 0) {
            // Print the answer to the system log.
            // You could store this into another list if you want to print out everything in one go.
            msg = answer.number + ',' + answer.count.toString() + ',' + answer.approvers.toString();
            gs.log('STORYBOOK: ' + msg);  // I use a tag in my log statements for ease of filtering.
        }

        // Store the new change request information.
        answer.number = approvals.sysapproval.number.toString();
        answer.count = 1;  // We set the count to 1 since we are already in a new set.
        answer.approvers = [approvals.approver.name.toString()];

        // If it enters into this if statement, then I want it to stop processing here and move on to the next row.
        // This I believe is called a guard clause.
        continue;
    }

    // If it hits this point, then we can assume that we are still processing the same set of approvals.
    // Increase the counter.
    answer.count++;
    answer.approvers.push(approvals.approver.name.toString());
}

// At the end of the loop, we will not detect another set of approvals.
// We will need to dump out anything remaining in the answer dictionary to the log.
// Only if there is something to be shown.
if (answer.count != 0) {
    // Print the answer to the system log.
    var msg = answer.number + ',' + answer.count.toString() + ',' + answer.approvers.toString();
    gs.log('STORYBOOK: ' + msg);
}
