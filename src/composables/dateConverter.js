import moment from "jalali-moment";

export default {
    convertToJalali: (date) => date && moment(date).locale("fa").format("YYYY/MM/DD"),
    convertToJalaliDateTime: (date) => date && moment(date).locale("fa").format("YYYY/M/D - HH:mm"),
    convertToMiladi: (date) => date && moment(date, "jYYYY-jMM-jDD").locale("en").format("YYYY-MM-DD"),
    someTimeAgo: (date) => date && moment(date).locale("fa").fromNow(),
    normalMiladi:(date)=> date && moment(date).format('YYYY-MM-DD'),
    dayInWeek:(date,format='dddd')=>date && moment(date).locale("fa").format(format),
    dayInMonth:(date)=>date&& moment(date).locale("fa").date()
}