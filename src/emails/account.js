const sgMail=require('@sendgrid/mail')
 sgMail.setApiKey(process.env.SENDGRID_API_KEY)
 require('dotenv').config()
 const sendWelcomeEmail= (email,name)=>{
 sgMail.send({
     to:email,
     from:'iamrameshgodara@gmail.com',
     subject:'Thanks for joinoing in!',
     text:`Welcome to this app ${name}. Let me know how you get along with this app`
 })
 }

 const sendCancelEmail= (email,name)=>{
     sgMail.send({
         to:email,
         from:'iamrameshgodara@gmail.com',
         subject:'sorry to see you go!',
         text:`Goodbye ${name}.I hope to see you back sometime soon.`
     })
 }
 module.exports={
     sendWelcomeEmail,
     sendCancelEmail
 }