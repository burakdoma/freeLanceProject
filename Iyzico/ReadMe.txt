*ReadMe*
*General*
- Max accepted email address length is assumed to be 254, where the local part may be up to 64 characters (RCF 5321 & RCF 5322).
- Since expected behaviour of "API Anahtarlari" (when no current key exists) is not visible, cases are based on some assumptions.
- On "Ayarlar - Bilgilerim" there is no update option. Also there is no info on user stories or a clear path to make assumptions this section is not covered
- See inline comments for some assumptions, and todo items
- Error handling is not customized

*ReadMe*
*Test Execution*
- To run the cases, please run the TestRunner.xml
- Since after several attempts of registration captcha is displayed, most tests fail if they are all run in one batch
