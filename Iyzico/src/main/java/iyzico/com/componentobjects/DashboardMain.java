package main.java.iyzico.com.componentobjects;

import main.java.iyzico.com.base.Pages;
import org.junit.Assert;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Created by seday on 24/08/16.
 */
public class DashboardMain {
    final WebDriver driver;

    @FindBy(className = "fa-wrench")
    private WebElement settingsMenuItem;

    public DashboardMain(WebDriver driver) {
        this.driver = driver;
    }

    public void clickSettingsMenuItem(){
        JavascriptExecutor executor = (JavascriptExecutor)driver;
        executor.executeScript("arguments[0].click();", settingsMenuItem);
        String currentUrl = driver.getCurrentUrl();
        Assert.assertEquals(currentUrl, Pages.settingsPage);
    }


}
