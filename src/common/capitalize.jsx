export const capitalize = (str) => {

    if(!str) { return }

    if(str.length){
        return str[0].toUpperCase() + str.substring(1, str.length)
    }
    
    return str;
}