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

export const fillMissingDays = (data, days = 30) => { // function to fill empty days for chart
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - (days - 1));

    // Turn API data into a map for quick lookup
    const countMap = Object.fromEntries(data.map(item => [item.date, item.count]));

    const filled = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        filled.push({
            date: dateStr,
            count: countMap[dateStr] || 0
        });
    }

    return filled;
}