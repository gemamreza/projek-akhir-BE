const verify = (username,pass,email) => {
    return {
        from : 'Purwadhika <purwadhika@purwadhika.com>' ,
        to : email ,
        subject : 'Verifikasi Email' ,
        html : `<h1>Klik 
                <a 
                href='http://localhost:3000/verify?username=${username}&password=${pass}'> 
                Link ini
                </a> Untuk verifikasi email</h1> `
    }
}

module.exports = verify