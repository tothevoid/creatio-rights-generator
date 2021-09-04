import sqlConstants  from "./constants/constants.js"
import mssqlFormatter from "./mssqlFormatter.js"
import postgreFormatter from "./postgreFormatter.js"

const getFormatter = (format) => {
    switch (format){
        case (sqlConstants.MSSQL):
            return mssqlFormatter;
        case (sqlConstants.PostgreSQL):
            return postgreFormatter;
        default:
            throw new Error("Invalid format passed");
    }
}

export default getFormatter;