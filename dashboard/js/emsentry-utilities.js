function convertUtcToLocalDate(utcDateTimeString) {
    var utcDateTime = new Date(utcDateTimeString);
    var newDate = new Date(utcDateTime.getTime() - utcDateTime.getTimezoneOffset() * 60 * 1000);
    return newDate;
}
function convertUtcToLocal(utcDateTimeString) {
    var newDate = convertUtcToLocalDate(utcDateTimeString);
    return newDate.toLocaleString();
}
function convertUtcToLocalFormat(utcDateTime) {
    const date = convertUtcToLocalDate(utcDateTime);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}
