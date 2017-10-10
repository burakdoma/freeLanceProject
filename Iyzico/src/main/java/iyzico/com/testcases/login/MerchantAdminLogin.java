package main.java.iyzico.com.testcases.login;

import main.java.iyzico.com.base.BaseTestCase;
import main.java.iyzico.com.base.Pages;
import main.java.iyzico.com.base.UserInfo;
import main.java.iyzico.com.common.emailAddressGenerator;
import main.java.iyzico.com.common.passwordGenerator;
import main.java.iyzico.com.componentobjects.DashboardMain;
import main.java.iyzico.com.componentobjects.MerchantAdminMain;
import main.java.iyzico.com.componentobjects.MerchantAdminRegister;
import org.junit.Assert;
import org.openqa.selenium.support.PageFactory;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Created by seday on 23/08/16.
 */
public class MerchantAdminLogin extends BaseTestCase {
    MerchantAdminMain merchantAdminMain;
    MerchantAdminRegister merchantAdminRegister;
    emailAddressGenerator emailAddressGenerator = new emailAddressGenerator();
    passwordGenerator passwordGenerator = new passwordGenerator();

    @BeforeMethod
    public void beforeMethod() {
        super.beforeMethod();
        driver.get(Pages.loginPage);
        merchantAdminMain = PageFactory.initElements(driver, MerchantAdminMain.class);
        merchantAdminRegister = PageFactory.initElements(driver, MerchantAdminRegister.class);
    }

    @Test
    public void freeFormValidation(){
        merchantAdminMain.clickLoginButton();
        merchantAdminMain.emailRequiredMessageDisplayed();
        merchantAdminMain.passwordRequiredMessageDisplayed();
    }

    @Test
    public void invalidDataLogin(){
        merchantAdminMain.enterEmailAddress(emailAddressGenerator.validEmailGenerator());
        merchantAdminMain.enterPassword(passwordGenerator.validPasswordGenerator());
        merchantAdminMain.clickLoginButton();
        merchantAdminMain.errorMessageContainerDisplayed();
    }

    @Test
    public void successfulLogin(){
        String userEmailAddress = UserInfo.validLoginUserEmailAddress;
        merchantAdminMain.enterEmailAddress(userEmailAddress);
        merchantAdminMain.enterPassword(UserInfo.validLoginUserPassword);
        merchantAdminMain.clickLoginButton();
        Assert.assertEquals(driver.getCurrentUrl(), Pages.dashboardPage);
        // TODO logged in kontrolu eklenmeli
    }

    @Test
    public void registerButtonNavigation(){
        merchantAdminMain.clickRegisterButton();
        Assert.assertEquals(driver.getCurrentUrl(), Pages.registerPage);
    }

    @Test
    public void forgotPasswordLinkNavigation(){
        merchantAdminMain.clickForgotPassword();
        Assert.assertEquals(driver.getCurrentUrl(), Pages.forgotPasswordPage);
    }

    @AfterMethod
    public void afterMethod() {
        super.afterMethod();
    }
}
