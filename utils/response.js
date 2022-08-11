module.exports = (statusCode, status, message, data) => {
    return {
        data: data,
        status: status,
        message: message,
        statusCode: statusCode,
    }
}



// var res = Response(200, "ok", "Login Successfully", { id: 1, user_name: "Usama" });