package main.java.iyzico.com.componentobjects;

import main.java.iyzico.com.base.Pages;
import main.java.iyzico.com.common.emailAddressGenerator;
import main.java.iyzico.com.common.passwordGenerator;
import main.java.iyzico.com.common.phoneNumberGenerator;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;

import java.util.List;

/**
 * Created by seday on 17/08/16.
 */
public class MerchantAdminRegister {
    final WebDriver driver;

    emailAddressGenerator emailAddressGenerator = new emailAddressGenerator();
    passwordGenerator passwordGenerator = new passwordGenerator();
    phoneNumberGenerator phoneNumberGenerator = new phoneNumberGenerator();

    //Content to find
    private String imageAttributeSrc = "/images/logo@2x.png";
    private String formFillText = "Üye olmak için lütfen aşağıdaki formu eksiksiz olarak doldurun";
    private String copyRightText = "© 2016";
    private String passwordInfoMessage = "Şifreniz en az 1 büyük, 1 küçük harf, 1 rakam içermeli ve en az 8 karakter uzunluğunda olmalıdır.";

    //Error messages
    private String errorMessageContainerDefaultText = "Kayıt Hatası";
    private String errorMessageInvalidEmail = "Hatalı e-posta girişi!";
    private String errorMessagePasswordConfirmationDoesNotMatch = "Şifre ve onay şifresi eşleşmiyor!";
    private String errorMessageInvalidPhoneNumber = "";


    @FindBys(@FindBy(tagName = "img"))
    private List<WebElement> images;

    @FindBy(className = "sandbox-logo-text")
    private WebElement sandboxLogo;

    @FindBy(id = "email")
    private WebElement emailField;

    @FindBy(id = "secretWord")
    private WebElement passwordField;

    @FindBy(className = "fakeTooltipArea")
    private WebElement passwordInfo;

    @FindBy(className = "tooltip-inner")
    private WebElement passwordInfoTooltip;

    @FindBy(id = "confirmSecretWord")
    private WebElement passwordConfirmationField;

    @FindBy(id = "phoneNumber")
    private WebElement phoneNumberField;

    @FindBy(className = "fa-key")
    private WebElement registerButton;

    @FindBy(className = "fa-lock")
    private WebElement loginButton;

    @FindBy(id = "toast-container")
    private WebElement errorMessageContainer;

    @FindBy(className = "login-header")
    private WebElement body;

    @FindBy(id = "email-error")
    private WebElement emailRequiredError;

    @FindBy(id = "secretWord-error")
    private WebElement passwordRequiredError;

    @FindBy(id = "confirmSecretWord-error")
    private WebElement passwordConfirmationRequiredError;

    @FindBy(id = "phoneNumber-error")
    private WebElement phoneNumberRequiredError;



    public MerchantAdminRegister(WebDriver driver) {
        this.driver = driver;
    }


    public void checkIyzicoLogoExists() {
        Assert.assertTrue(images.get(0).getAttribute("src").contains(imageAttributeSrc));
    }
    public void checkSandboxLogoExists() {
        sandboxLogo.isDisplayed();
    }
    public void checkFreeTextOnPage() {
        Assert.assertTrue(body.getText().contains(formFillText));
        Assert.assertTrue(body.findElement(By.xpath("..")).getText().contains(copyRightText));
    }
    public void checkFormElementsExist(){
        emailField.isDisplayed();
        passwordField.isDisplayed();
        passwordConfirmationField.isDisplayed();
        phoneNumberField.isDisplayed();
    }
    public void checkButtonsExistOnPage(){
        registerButton.isDisplayed();
        loginButton.isDisplayed();
    }

// Basic main actions
    public void enterEmailAddress(String emailAdress){
        emailField.sendKeys(emailAdress);
    }
    public void enterPassword(String password){
        passwordField.sendKeys(password);
    }
    public void clickPasswordInfo(){ passwordInfo.click(); }
    public void enterPasswordConfirmation(String passwordConfirmation) { passwordConfirmationField.sendKeys(passwordConfirmation); }
    public void enterPhoneNumber(String phoneNumber) { phoneNumberField.sendKeys(phoneNumber); }
    public void clickRegisterButton(){ registerButton.click(); }
    public void clickLoginButton() { loginButton.click(); }

/// Required Field Validation Messages
    public void passwordInfoTextMessageCheck(){
        clickPasswordInfo();
        Assert.assertEquals(passwordInfo.getAttribute("data-original-title"), passwordInfoMessage);
    }
    public void passwordInfoMessageDisplayed(){
        passwordInfoTooltip.isDisplayed();
    }
    public void errorMessageContainerDisplayed(){
        errorMessageContainer.isDisplayed();
        Assert.assertTrue(errorMessageContainer.getText().contains(errorMessageContainerDefaultText));
    }
    public void invalidEmailErrorMessageDisplayed(){
        errorMessageContainerDisplayed();
        Assert.assertTrue(errorMessageContainer.getText().contains(errorMessageInvalidEmail));
    }
    public void invalidPasswordConfirmationMatchErrorMessageDisplayed(){
        errorMessageContainerDisplayed();
        Assert.assertTrue(errorMessageContainer.getText().contains(errorMessagePasswordConfirmationDoesNotMatch));
    }
    public void invalidPhoneNumberErrorMessageDisplayed(){
        errorMessageContainerDisplayed();
        Assert.assertTrue(errorMessageContainer.getText().contains(errorMessageInvalidPhoneNumber));
    }

// &Others (Registration & Form-filling
    public void fillSuccessfulRegistrationForm(){
        enterEmailAddress(emailAddressGenerator.validEmailGenerator());
        String password = passwordGenerator.validPasswordGenerator();
        enterPassword(password);
        enterPasswordConfirmation(password);
        enterPhoneNumber(phoneNumberGenerator.validPhoneNumberGenerator());
    }
    public void fillRegistrationFormInvalidEmail(String invalidEmail){
        enterEmailAddress(invalidEmail);
        String password = passwordGenerator.validPasswordGenerator();
        enterPassword(password);
        enterPasswordConfirmation(password);
        enterPhoneNumber(phoneNumberGenerator.validPhoneNumberGenerator());
    }
    public void fillRegistrationFormInvalidPhoneNumber(String invalidPhoneNumber) {
        enterEmailAddress(emailAddressGenerator.validEmailGenerator());
        String password = passwordGenerator.validPasswordGenerator();
        enterPassword(password);
        enterPasswordConfirmation(password);
        enterPhoneNumber(invalidPhoneNumber);
    }
    public void registrationSuccessful(){
        fillSuccessfulRegistrationForm();
        clickRegisterButton();
        Assert.assertEquals(driver.getCurrentUrl(), Pages.dashboardPage);
    }
    public void registrationWithInvalidEmailAddressErrorCheck(String invalidEmailAddress){
        fillRegistrationFormInvalidEmail(invalidEmailAddress);
        clickRegisterButton();
        invalidEmailErrorMessageDisplayed();
    }
    public void invalidPasswordErrorCheck(String invalidPassword){
        enterPassword(invalidPassword);
        passwordConfirmationField.click();
        passwordInfoMessageDisplayed();
    }
    public void registrationWithInvalidPhoneNumberErrorCheck(String invalidPhoneNumber){
        fillRegistrationFormInvalidPhoneNumber(invalidPhoneNumber);
        clickRegisterButton();
        invalidPhoneNumberErrorMessageDisplayed();
    }

// Error checking
    public void emailRequiredErrorCheck() {
        emailRequiredError.isDisplayed();
    }
    public void passwordRequiredErrorCheck() {
        passwordRequiredError.isDisplayed();
    }
    public void passwordConfirmationRequiredErrorCheck() {
        passwordConfirmationRequiredError.isDisplayed();
    }
    public void phoneNumberRequiredErrorCheck() {
         phoneNumberRequiredError.isDisplayed();
    }

}
