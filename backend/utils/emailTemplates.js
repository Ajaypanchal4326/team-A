const Verification_Email_Template=`
    <div class="otp-box-wrapper">
      <div class="otp-box">{otp}</div>
    </div>
`;

const Welcome_Email_Template= `
    <p>Hi <span class="highlight-box">{name}</span>,</p>
`

module.exports = {Verification_Email_Template,Welcome_Email_Template};