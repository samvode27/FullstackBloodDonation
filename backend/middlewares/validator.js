const Joi = require('joi')

const signupSchema = Joi.object({
   email: Joi.string().min(6)
                      .max(60)
                      .required()
                      .email({
                         tlds: {allow: ['com', 'net']}                                                                              
                      }),
    password: Joi.string().required()
                          .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'))                                                                                               
})

const signinSchema = Joi.object({
   email: Joi.string().min(6)
                      .max(60)
                      .required()
                      .email({
                         tlds: {allow: ['com', 'net']}                                                                              
                      }),
    password: Joi.string().required()
                          .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'))                                                                                               
})

const acceptCodeSchema = Joi.object({
   email: Joi.string().min(6)
                      .max(60)
                      .required()
                      .email({
                         tlds: {allow: ['com', 'net']}                                                                              
                      }),
                      providedCode: Joi.number().required()
})

const changePasswordSchema = Joi.object({
   newPassword: Joi.string().required()
                            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')), 
   oldPassword: Joi.string().required()
                            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')) 
})

const acceptForgotPasswordCodeSchema = Joi.object({
   email: Joi.string().min(6)
   .max(60)
   .required()
   .email({
      tlds: {allow: ['com', 'net']}                                                                              
   }),
   
   providedCode: Joi.number().required(),

   newPassword: Joi.string().required()
   .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')), 
})

module.exports = {changePasswordSchema, acceptForgotPasswordCodeSchema, signinSchema, signupSchema, acceptCodeSchema}