let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const getDay = (timestamp) => {
    let date = new Date(timestamp);

    return `${date.getDate()} ${months[date.getMonth()]}`
}

export const getFullDay = (timestamp) => {
    let date = new Date(timestamp);

    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export const getFullTime = (timestamp) => {
    let date = new Date(timestamp);

    // time
    let hr = date.getHours();
    let min = date.getMinutes();
    let timeNotation = hr >= 12 ? "PM" : "AM";
    
    if(hr > 12){ hr = hr - 12 }
    if(hr == 0){ hr = 12 }
    if(hr < 10){ hr = '0' + hr }

    if(min < 10){ min = '0' + min }

    return `${hr}:${min} ${timeNotation} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}