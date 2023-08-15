const configEmailContents = {
  emailVerificationText: `<a href="https://www.google.com" target="_blank" style="font: bold 11px Arial;
    text-decoration: none;
    background-color: #FFA500;
    color: #333333;
    padding: 2px 6px 2px 6px;
    border-top: 1px solid #CCCCCC;
    border-right: 1px solid #333333;
    border-bottom: 1px solid #333333;
    border-left: 1px solid #CCCCCC;">Verify</a> `,

  forgetPasswordText: `<p> We heard that you lost your password. Sorry about that! </p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href='http://localhost:3001/api/user/reset-password'>http://localhost:3001/api/user/reset-password </a> 
  <p>Thanks </p>
  <p>Team Super Survey</p>`,
};

module.exports = configEmailContents;
