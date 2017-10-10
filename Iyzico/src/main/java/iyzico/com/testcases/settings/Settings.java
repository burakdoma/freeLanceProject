package main.java.iyzico.com.testcases.settings;

import main.java.iyzico.com.base.BaseTestCase;
import main.java.iyzico.com.base.Pages;
import main.java.iyzico.com.base.UserInfo;
import main.java.iyzico.com.componentobjects.DashboardMain;
import main.java.iyzico.com.componentobjects.DashboardSettings;
import main.java.iyzico.com.componentobjects.MerchantAdminMain;
import org.junit.Assert;
import org.openqa.selenium.support.PageFactory;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
/**
 * Created by burakdoma on 24/08/16.
 */
public class Settings extends BaseTestCase {
    DashboardMain dashboardMain;
    DashboardSettings dashboardSettings;
    MerchantAdminMain merchantAdminMain;

    @BeforeMethod
    public void beforeMethod() {
        super.beforeMethod();
        driver.get(Pages.loginPage);
        dashboardMain = PageFactory.initElements(driver, DashboardMain.class);
        dashboardSettings = PageFactory.initElements(driver, DashboardSettings.class);
        merchantAdminMain = PageFactory.initElements(driver, MerchantAdminMain.class);

        //Login
        merchantAdminMain.enterEmailAddress(UserInfo.validLoginUserEmailAddress);
        merchantAdminMain.enterPassword(UserInfo.validLoginUserPassword);
        merchantAdminMain.clickLoginButton();
        Assert.assertEquals(driver.getCurrentUrl(), Pages.dashboardPage);

        //Navigate to Settings page
        dashboardMain.clickSettingsMenuItem();
    }

    @Test
    public void hasApiKeys(){
        dashboardSettings.checkApiKeyExists();
        dashboardSettings.checkSecurityApiKeyExists();
    }

    @Test
    public void successfulLogoUpdate(){
        dashboardSettings.updateLogoUrl();
        dashboardSettings.updateSuccessfulMessageDisplayed();
    }

    //Since I do not know what to expect from the app on field validation, free text etc. are currently covered all in one.
    @Test
    public void notSecureLogoUpdate(){
        dashboardSettings.enterFreeTextLogoUrl("");
        dashboardSettings.clickUpdateForCompanyInfo();
    }

    @Test
    public void successfulThreeDLimitUpdate(){
        dashboardSettings.enterThreeDLimitAmount("12345");
        dashboardSettings.clickUpdateForThreeDLimit();
        dashboardSettings.updateSuccessfulMessageDisplayed();
    }

    // TODO: 3D Payment Negatives cases not covered

    @AfterMethod
    public void afterMethod() {
        super.afterMethod();
    }

}
