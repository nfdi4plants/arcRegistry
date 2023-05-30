function dateFormatter(dateString) {
    let defaultDate = "01-01-1900 01:01:01";
    if (dateString !== "") {
        let date = new Date(dateString);
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let hour = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return ((dd < 10) ? "0" + dd : dd) + "-" + ((mm < 10) ? "0" + mm : mm) + "-" + date.getFullYear() + " " + ((hour < 10) ? "0" + hour : hour) + ":" + ((minutes < 10) ? "0" + minutes : minutes) + ":" + ((seconds < 10) ? "0" + seconds : seconds);
    } else {
        return "01-01-1900 01:01:01";
    }
}
