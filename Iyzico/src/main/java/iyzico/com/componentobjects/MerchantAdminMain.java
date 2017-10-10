package main.java.iyzico.com.componentobjects;

import org.junit.Assert;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Created by seday on 17/08/16.
 */
public class MerchantAdminMain {
    final WebDriver driver;

    private String loginErrorMessage = "Giriş Hatası";
    private String loginErrorMessageContent = "E-posta veya şifre hatalı!";

    @FindBy(id = "email")
    private WebElement emailField;

    @FindBy(id = "password")
    private WebElement passwordField;

    @FindBy(id = "not-member")
    private WebElement registerButton;

    @FindBy(id = "login-button")
    private WebElement loginButton;

    @FindBy(id = "email-error")
    private WebElement emailRequiredError;

    @FindBy(id = "password-error")
    private WebElement passwordRequiredError;

    @FindBy(id = "toast-container")
    private WebElement errorMessageContainer;

    @FindBy(css = "a[href='reset']")
    private WebElement forgotPasswordLink;


    public MerchantAdminMain(WebDriver driver) {
        this.driver = driver;
    }

    public void enterEmailAddress(String emailAdress){
        emailField.sendKeys(emailAdress);
    }

    public void enterPassword(String password){
        passwordField.sendKeys(password);
    }

    public void clickRegisterButton(){ registerButton.click(); }

    public void clickLoginButton() { loginButton.click(); }

    public void clickForgotPassword(){ forgotPasswordLink.click();}

    public void errorMessageContainerDisplayed(){
        errorMessageContainer.isDisplayed();
        Assert.assertTrue(errorMessageContainer.getText().contains(loginErrorMessage));
        Assert.assertTrue(errorMessageContainer.getText().contains(loginErrorMessageContent));
    }

    public void emailRequiredMessageDisplayed() {
        emailRequiredError.isDisplayed();
    }

    public void passwordRequiredMessageDisplayed() {
        passwordRequiredError.isDisplayed();
    }

}
