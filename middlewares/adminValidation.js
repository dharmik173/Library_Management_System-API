const adminValidation = (req,res,next)=>{
try {
    const userData = req.user
    console.log('userData: ', userData);
        if(userData.role !=="admin"){
            throw new Error("you are not an admin")
        }
        next()
} catch (error) {
    res.status(401).json({
        message: "Something went wrong: " + error.message,
        statusCode: 401
      });
}
}

module.exports = adminValidation