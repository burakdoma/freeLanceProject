package main.java.iyzico.com.componentobjects;

import main.java.iyzico.com.base.UserInfo;
import main.java.iyzico.com.common.passwordGenerator;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * Created by burakdoma on 26/08/16.
 */
public class Profile {
    final WebDriver driver;

    public String successfulUpdateMessage = "Profil bilgileriniz başarıyla güncellenmiştir.";
    public String successfulPasswordUpdateMessage = "Şifreniz başarıyla güncellenmiştir.";

    @FindBy(id = "name")
    private WebElement nameField;

    @FindBy(id = "surname")
    private WebElement surnameField;

    @FindBy(id = "gsmNumber")
    private WebElement phoneNumberField;

    @FindBy(id = "oldSecretWord")
    private WebElement oldPasswordField;

    @FindBy(id = "newSecretWord")
    private WebElement newPasswordField;

    @FindBy(id = "confirmSecretWord")
    private WebElement newPasswordConfirmationField;

	@FindBy(id = "passwordSaveButton")
	private WebElement changePasswordButton;

	@FindBy(id = "name-error")
	private WebElement nameError;

	@FindBy(id = "surname-error")
	private WebElement surnameError;

	@FindBy(id = "gsmNumber-error")
	private WebElement phoneNumberError;

	@FindBy(id = "oldSecretWord-error")
	private WebElement oldPasswordError;

	@FindBy(id = "newSecretWord-error")
	private WebElement newPasswordError;

	@FindBy(id = "confirmSecretWord-error")
	private WebElement newPasswordConfirmationError;

	@FindBy(className = "toast-message")
	private WebElement updateMessageBox;



    public Profile(WebDriver driver) {
        this.driver = driver;
    }

    public void enterName(String name){
        nameField.clear();
        nameField.sendKeys(name);
    }

    public void nameFieldValidationDisplayed(){
        nameError.isDisplayed();
    }

    public void clickUpdateForProfileSettings(){
        WebElement element = nameField.findElement(By.xpath("..")).findElement(By.xpath("..")).findElement(By.xpath("..")).findElement(By.className("btn"));
        element.click();
    }

    public void enterSurname(String surname) {
        surnameField.clear();
        surnameField.sendKeys(surname);
    }

    public void surnameFieldValidationDisplayed(){
        surnameError.isDisplayed();
    }

    public void enterPhoneNumber(String phoneNumber){
        phoneNumberField.clear();
        phoneNumberField.sendKeys(phoneNumber); }

    public void phoneNumberValidationMessageDisplayed(){ phoneNumberError.isDisplayed(); }

    public void updateProfileSettings(String name, String surname, String phoneNumber){
        nameField.clear();
        nameField.sendKeys(name);
        surnameField.clear();
        surnameField.sendKeys(surname);
        phoneNumberField.clear();
        phoneNumberField.sendKeys(phoneNumber);
    }

    public void updateSuccessfulMessageDisplayed(){
        Assert.assertEquals(successfulUpdateMessage, updateMessageBox.getText());
    }

    public void clickChangePasswordButton(){
        changePasswordButton.click();
    }

    public void enterOldPassword(String password){
        oldPasswordField.sendKeys(password);
    }

    public void enterNewPassword(String password) { newPasswordField.sendKeys(password); }

    public void enterNewPasswordConfirmation(String password) { newPasswordConfirmationField.sendKeys(password); }

    public void oldPasswordValidationDisplayed(){ oldPasswordError.isDisplayed(); }

    public void newPasswordValidationDisplayed(){ newPasswordError.isDisplayed(); }

    public void newPasswordConfirmationDisplayed() { newPasswordConfirmationError.isDisplayed(); }

    public void invalidPasswordErrorCheck(String password){
        enterOldPassword(UserInfo.validLoginUserPassword);
        enterNewPassword(password);
        enterNewPasswordConfirmation(password);
        clickChangePasswordButton();
        newPasswordValidationDisplayed();
        newPasswordConfirmationDisplayed();
    }

    public void successfulPasswordUpdateMessageDisplayed(){
        Assert.assertEquals(successfulPasswordUpdateMessage, updateMessageBox.getText());
    }

}
