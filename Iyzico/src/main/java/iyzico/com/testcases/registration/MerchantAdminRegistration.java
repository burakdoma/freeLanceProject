package main.java.iyzico.com.testcases.registration;

import main.java.iyzico.com.base.BaseTestCase;
import main.java.iyzico.com.base.Pages;
import main.java.iyzico.com.common.emailAddressGenerator;
import main.java.iyzico.com.common.passwordGenerator;
import main.java.iyzico.com.common.phoneNumberGenerator;
import main.java.iyzico.com.componentobjects.MerchantAdminMain;
import main.java.iyzico.com.componentobjects.MerchantAdminRegister;
import org.openqa.selenium.support.PageFactory;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Created by seday on 17/08/16.
 */

// After x times of registration attempts captcha is displayed, cannot run the whole suit as one batch.

public class MerchantAdminRegistration extends BaseTestCase{
    MerchantAdminMain merchantAdminMain;
    MerchantAdminRegister merchantAdminRegister;
    emailAddressGenerator emailAddressGenerator = new emailAddressGenerator();
    passwordGenerator passwordGenerator = new passwordGenerator();
    phoneNumberGenerator phoneNumberGenerator = new phoneNumberGenerator();

    @BeforeMethod
    public void beforeMethod() {
        super.beforeMethod();
        driver.get(Pages.registerPage);
        merchantAdminMain = PageFactory.initElements(driver, MerchantAdminMain.class);
        merchantAdminRegister = PageFactory.initElements(driver, MerchantAdminRegister.class);
    }

    @Test
    public void logoIyzicoExists(){
        merchantAdminRegister.checkIyzicoLogoExists();
    }

    @Test
    public void logoSandboxExists(){
        merchantAdminRegister.checkSandboxLogoExists();
    }

    @Test
    public void freeTextDisplayedOnPage(){
        merchantAdminRegister.checkFreeTextOnPage();
    }

    @Test
    public void fromFieldsDisplayedOnPage(){
        merchantAdminRegister.checkFormElementsExist();
    }

    @Test
    public void passwordInfoTooltipText() {
        merchantAdminRegister.passwordInfoTextMessageCheck();
    }

    @Test
    public void buttonsDisplayedOnPage(){
        merchantAdminRegister.checkButtonsExistOnPage();
        //Isimlerini burada yazmak daha mi dogru veya testNG ye parametre olarak girmek?
    }

    @Test
    public void freeFieldValidation(){
        merchantAdminRegister.clickRegisterButton();
        merchantAdminRegister.emailRequiredErrorCheck();
        merchantAdminRegister.passwordRequiredErrorCheck();
        merchantAdminRegister.passwordConfirmationRequiredErrorCheck();
        merchantAdminRegister.phoneNumberRequiredErrorCheck();
    }

    @Test (description = "Invalid email address: no '@' sign")
    public void registerWithInvalidEmailNoAtSign(){
        merchantAdminRegister.registrationWithInvalidEmailAddressErrorCheck(emailAddressGenerator.randomInvalidEmailGeneratorWithNoAtSign());
    }

    @Test (description = "Invalid email address: no domain name")
    public void registerWithInvalidEmailNoDomainName(){
        merchantAdminRegister.registrationWithInvalidEmailAddressErrorCheck(emailAddressGenerator.randomInvalidEmailGeneratorWithNoDomain());
    }

    @Test (description = "Invalid email address: longer than max length allowed")
    public void registerWithInvalidEmailLongerThanMaxAllowed(){
        merchantAdminRegister.registrationWithInvalidEmailAddressErrorCheck(emailAddressGenerator.randomInvalidEmailGeneratorLargerThanMaxLengthAllowed());
    }

    @Test (description = "Invalid password: local character")
    public void invalidPasswordWithLocalCharacter(){
        merchantAdminRegister.invalidPasswordErrorCheck(passwordGenerator.inValidPasswordGeneratorWithLocalCharacters());
    }

    @Test (description = "Invalid password: no uppercase")
    public void invalidPasswordWithNoUpperCase(){
        merchantAdminRegister.invalidPasswordErrorCheck(passwordGenerator.invalidPasswordGeneratorNoUpperCase());
    }

    @Test (description = "Invalid password: no lowercase")
    public void invalidPasswordWithNoLowerCase(){
        merchantAdminRegister.invalidPasswordErrorCheck(passwordGenerator.invalidPasswordGeneratorWithNoLowerCase());
    }

    @Test (description = "Invalid password: shorter than min length")
    public void invalidPasswordShorterThanMinLength(){
        merchantAdminRegister.invalidPasswordErrorCheck(passwordGenerator.invalidPasswordGeneratorShorterThanMinLength());
    }

    @Test (description = "Invalid password: no number")
    public void invalidPasswordNoNumber(){
        merchantAdminRegister.invalidPasswordErrorCheck(passwordGenerator.invalidPasswordGeneratorWithNoNumber());
    }

    @Test (description = "Password and confirmation do not match")
    public void passwordConfirmationDoNotMatch() {
        merchantAdminRegister.enterEmailAddress(emailAddressGenerator.validEmailGenerator());
        merchantAdminRegister.enterPassword(passwordGenerator.validPasswordGenerator());
        merchantAdminRegister.enterPasswordConfirmation(passwordGenerator.validPasswordGenerator());
        merchantAdminRegister.enterPhoneNumber(phoneNumberGenerator.validPhoneNumberGenerator());
        merchantAdminRegister.clickRegisterButton();
        merchantAdminRegister.invalidPasswordConfirmationMatchErrorMessageDisplayed();
    }

    @Test (description = "Invalid phone number")
    public void invalidPhoneNumber(){
        merchantAdminRegister.registrationWithInvalidPhoneNumberErrorCheck(phoneNumberGenerator.invalidPhoneNumberGenerator());
    }

    @Test
    public void successfulRegistration(){
        merchantAdminRegister.registrationSuccessful();
    }

    @Test
    public void navigateWithLoginButton(){
        merchantAdminRegister.clickLoginButton();
        expectCurrentUrlToBe(Pages.loginPage);
    }

    @AfterMethod
    public void afterMethod() {
        super.afterMethod();
    }
}

