export async function getLeaderBoard() {

    getTimeStampofCurrentMonth();

}

function getTimeStampofCurrentMonth() {
    // Get the current date
    const currentDate = new Date();

    // Set the date to the first day of the month
    currentDate.setDate(1);

    // Set the time to midnight (start of the day)
    currentDate.setHours(0, 0, 0, 0);

    // Get the milliseconds of the start of the month
    const startOfMonthMilliseconds = currentDate.getTime();

    console.log("Milliseconds of the start of the month:", startOfMonthMilliseconds)
}