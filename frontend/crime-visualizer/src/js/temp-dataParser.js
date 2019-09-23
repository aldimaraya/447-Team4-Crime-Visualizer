export function dataToHeatmap(data){

    var newArray = [];

    data.map((crime, index) => {
        var dict = {};

        dict["COORDINATES"] = [crime.latitude, crime.longitude];
        dict["WEIGHTS"] = 10

        newArray.push(dict);
    });

    console.log(newArray);
    return newArray;
}