package main.java.iyzico.com.common;

import java.util.Random;

/**
 * Created by seday on 18/08/16.
 */
public class passwordGenerator {
    randomGenerator randomGenerator = new randomGenerator();
    Random random = new Random();

    // pw rules: Şifreniz en az 1 büyük, 1 küçük harf, 1 rakam içermeli ve en az 8 karakter uzunluğunda olmalıdır.
    // Allowed max length: based on assumption

    private int allowedMinPasswordLength = 8;
    private int allowedMaxPasswordLength = 50;

    public String validPasswordGenerator() {
        return randomGenerator.randomAlphaNumericGeneratorRandomLength(allowedMinPasswordLength - 3, allowedMaxPasswordLength - 3) +
                randomGenerator.randomNumberGenerator(1) +
                randomGenerator.randomStringGeneratorSetLength(1).toUpperCase() +
                randomGenerator.randomStringGeneratorSetLength(1).toLowerCase();
    }

    public String inValidPasswordGeneratorWithLocalCharacters() {
        String validPassword = validPasswordGenerator();
        String turkishCharacters = "çğıİöşüÇĞÖŞÜ";
        return validPassword + turkishCharacters.charAt(random.nextInt(turkishCharacters.length()));
    }

    public String invalidPasswordGeneratorNoUpperCase() {
        String validPassword = validPasswordGenerator();
        return validPassword.toLowerCase();
    }

    public String invalidPasswordGeneratorWithNoLowerCase() {
        String validPassword = validPasswordGenerator();
        return validPassword.toUpperCase();
    }

    public String invalidPasswordGeneratorWithNoNumber() {
        return randomGenerator.randomStringGeneratorSetLength(allowedMinPasswordLength).toLowerCase() +
                randomGenerator.randomStringGeneratorSetLength(1).toUpperCase();
    }

    public String invalidPasswordGeneratorShorterThanMinLength() {
        return randomGenerator.randomStringGeneratorSetLength(1).toLowerCase() +
                randomGenerator.randomStringGeneratorSetLength(1).toUpperCase() +
                randomGenerator.randomNumberGenerator(allowedMinPasswordLength-3);
    }
}