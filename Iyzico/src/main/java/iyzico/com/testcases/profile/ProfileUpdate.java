package main.java.iyzico.com.testcases.profile;

import main.java.iyzico.com.base.BaseTestCase;
import main.java.iyzico.com.base.Pages;
import main.java.iyzico.com.base.UserInfo;
import main.java.iyzico.com.common.passwordGenerator;
import main.java.iyzico.com.common.phoneNumberGenerator;
import main.java.iyzico.com.common.randomGenerator;
import main.java.iyzico.com.componentobjects.MerchantAdminMain;
import main.java.iyzico.com.componentobjects.Profile;
import org.junit.Assert;
import org.openqa.selenium.support.PageFactory;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Created by burakdoma on 26/08/16.
 */
public class ProfileUpdate extends BaseTestCase {
    Profile profile;
    MerchantAdminMain merchantAdminMain;
    randomGenerator randomGenerator = new randomGenerator();
    phoneNumberGenerator phoneNumberGenerator = new phoneNumberGenerator();
    passwordGenerator passwordGenerator = new passwordGenerator();

    @BeforeMethod
    public void beforeMethod() {
            super.beforeMethod();

            profile = PageFactory.initElements(driver, Profile.class);
            merchantAdminMain = PageFactory.initElements(driver, MerchantAdminMain.class);

            //Login
            driver.get(Pages.profile);
            if (driver.getCurrentUrl().equals(Pages.loginPage)) {
                merchantAdminMain.enterEmailAddress(UserInfo.validLoginUserEmailAddress);
                merchantAdminMain.enterPassword(UserInfo.validLoginUserPassword);
                merchantAdminMain.clickLoginButton();
                Assert.assertEquals(driver.getCurrentUrl(), Pages.profile);
            }
            else if (driver.getCurrentUrl().equals(Pages.profile)){}
        }

    @Test
    public void nameFieldValidationCheck(){
        profile.enterName("");
        profile.clickUpdateForProfileSettings();
        profile.nameFieldValidationDisplayed();
    }

    @Test
    public void surnameFieldValidation(){
        profile.enterSurname("");
        profile.clickUpdateForProfileSettings();
        profile.surnameFieldValidationDisplayed();
    }

    @Test
    public void phoneNumberFieldValidation(){
        profile.enterPhoneNumber("");
        profile.clickUpdateForProfileSettings();
        profile.phoneNumberValidationMessageDisplayed();
        }

    @Test
    public void successfulUpdateOfProfileSettings(){
        // Limits are hardcoded - should be covered somewhere else (current min 2)
        String name = randomGenerator.randomStringGeneratorRandomLength(2, 10).toUpperCase();
        String surname = randomGenerator.randomStringGeneratorRandomLength(2, 10).toUpperCase();
        String phoneNumber = phoneNumberGenerator.validPhoneNumberGenerator();
        profile.updateProfileSettings(name, surname, phoneNumber);
        profile.clickUpdateForProfileSettings();
        profile.updateSuccessfulMessageDisplayed();
    }

    // (description = "Invalid password: local character") - criteria on local characters unknown (not covered)

    @Test (description = "Invalid password: no uppercase")
    public void invalidPasswordWithNoUpperCase(){
        profile.invalidPasswordErrorCheck(passwordGenerator.invalidPasswordGeneratorNoUpperCase());
    }

    @Test (description = "Invalid password: no lowercase")
    public void invalidPasswordWithNoLowerCase(){
        profile.invalidPasswordErrorCheck(passwordGenerator.invalidPasswordGeneratorWithNoLowerCase());
    }

    @Test (description = "Invalid password: shorter than min length")
    public void invalidPasswordShorterThanMinLength(){
        profile.invalidPasswordErrorCheck(passwordGenerator.invalidPasswordGeneratorShorterThanMinLength());
    }

    @Test (description = "Invalid password: no number")
    public void invalidPasswordNoNumber(){
        profile.invalidPasswordErrorCheck(passwordGenerator.invalidPasswordGeneratorWithNoNumber());
    }

    @Test (description = "Password and confirmation do not match")
    public void passwordConfirmationDoNotMatch() {
        profile.enterOldPassword(UserInfo.validLoginUserPassword);
        profile.enterNewPassword(passwordGenerator.validPasswordGenerator());
        profile.enterNewPasswordConfirmation(passwordGenerator.validPasswordGenerator());
        profile.clickChangePasswordButton();
        profile.newPasswordValidationDisplayed();
    }

    @Test
    public void oldPasswordDoNotMatch(){
        profile.enterOldPassword(passwordGenerator.validPasswordGenerator());
        String password = passwordGenerator.validPasswordGenerator();
        profile.enterNewPassword(password);
        profile.enterNewPasswordConfirmation(password);
        profile.clickChangePasswordButton();
        profile.oldPasswordValidationDisplayed();
    }

    @Test
    public void successfulPasswordChange(){
        profile.enterOldPassword(UserInfo.validLoginUserPassword);
        profile.enterNewPassword(UserInfo.temporaryValidLoginPassword);
        profile.enterNewPasswordConfirmation(UserInfo.temporaryValidLoginPassword);
        profile.clickChangePasswordButton();
        profile.successfulPasswordUpdateMessageDisplayed();

        //Cleaning
        profile.enterOldPassword(UserInfo.temporaryValidLoginPassword);
        profile.enterNewPassword(UserInfo.validLoginUserPassword);
        profile.enterNewPasswordConfirmation(UserInfo.validLoginUserPassword);
        profile.clickChangePasswordButton();
    }

    @AfterMethod
    public void afterMethod() {
        super.afterMethod();
    }
}
