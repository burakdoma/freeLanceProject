package main.java.iyzico.com.base;

import org.junit.Assert;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

/**
 * Created by seday on 17/08/16.
 */

public class BaseTestCase {
    protected static WebDriver driver = null;

    public void beforeMethod() {
        driver = new FirefoxDriver();
        driver.manage().window().maximize();
    }
    public void afterMethod(){
        driver.quit();
    }

    public void expectCurrentUrlToBe(String url){
        Assert.assertEquals(driver.getCurrentUrl(), url);
    }
    public void navigateToPreviousPage() {
        driver.navigate().back();
    }
    public void navigateToNextPage() { driver.navigate().forward(); }
}
