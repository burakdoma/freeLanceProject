package main.java.iyzico.com.componentobjects;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;

import java.awt.*;

/**
 * Created by burakdoma on 24/08/16.
 */
public class DashboardSettings {
    final WebDriver driver;

    String sampleLogoUrl = "https://pespespes.files.wordpress.com/2013/07/fc-barcelona.png";
    String updateSuccessfulMessage = "İşleminiz başarıyla gerçekleştirilmiştir.";
    String logoUpdateUrlNotSecureMessage = "Logonuz secure ortamdan servis edilmelidir";

    @FindBy(id = "merchantId")
    private WebElement merchantIdField;

    @FindBy(id = "workingArea")
    private WebElement companyTypeField;

    @FindBy(id = "legalCompanyTitle")
    private WebElement legalCompanyTitleField;

    @FindBy(id = "website")
    private WebElement websiteField;

    @FindBy(id = "iban")
    private WebElement ibanField;

    @FindBy(id = "email")
    private WebElement emailField;

    @FindBy(id = "logoUrl")
    private WebElement logoUrlField;

    @FindBy(className = "toast-message")
    private WebElement notificationBox;

    @FindBy(id = "forceThreeDsAmount")
    private WebElement threeDLimitAmountField;

    //@FindBy - Guncelle butonlari icin unique id olmadigindan, goreceli olarak tanimlandi.
    public DashboardSettings(WebDriver driver) {
        this.driver = driver;
    }

    public void checkApiKeyExists(){
        // TODO: change to css and add parent - child relationship
        WebElement apiKey = driver.findElement(By.xpath("//pre[contains(@data-real-value,'sandbox-')]"));
    }
    public void checkSecurityApiKeyExists(){
        // TODO: change to css and add parent - child relationship
        WebElement securityApiKey = driver.findElement(By.xpath("//pre[contains(@data-real-value,'sandbox-')]"));
    }
    public void clickUpdateForCompanyInfo(){
        logoUrlField.findElement(By.xpath("..")).findElement(By.xpath("..")).findElement(By.xpath("..")).findElement(By.className("btn")).click();
    }
    public void enterValidLogoUrl(){
        logoUrlField.sendKeys(sampleLogoUrl);
    }
    public void enterFreeTextLogoUrl(String url){
        String selectAllText = Keys.chord(Keys.CONTROL, "a");
        logoUrlField.sendKeys(selectAllText);
        logoUrlField.sendKeys(Keys.DELETE);
        logoUrlField.sendKeys(url);
    }
    public void updateLogoUrl(){
        enterValidLogoUrl();
        clickUpdateForCompanyInfo();
    }
    public void updateSuccessfulMessageDisplayed(){
        Assert.assertEquals(notificationBox.getText(), updateSuccessfulMessage);
    }

    public void logoUpdateErrorMessageDisplayed(){
        Assert.assertEquals(notificationBox.getText(), logoUpdateUrlNotSecureMessage);
    }

    public void enterThreeDLimitAmount(String amount){
        threeDLimitAmountField.sendKeys(amount);
    }

    public void clickUpdateForThreeDLimit(){
        threeDLimitAmountField.findElement(By.xpath("..")).findElement(By.xpath("..")).findElement(By.xpath("..")).findElement(By.xpath("..")).findElement(By.className("btn")).click();
    }
}
