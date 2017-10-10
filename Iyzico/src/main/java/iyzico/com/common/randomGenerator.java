package main.java.iyzico.com.common;

import org.apache.commons.lang3.RandomStringUtils;
import java.util.Random;

/**
 * Created by burakdoma on 18/08/16.
 */

public class randomGenerator {
    Random rand = new Random();

    public String randomNumberGenerator(int numberOfDigits) {
        int counter = 0;
        String number = "";
        while (counter < numberOfDigits) {
            int randNumber = rand.nextInt(9);
            number = number + Integer.toString(randNumber);
            counter++;
        }
        return number;
    }

    public int randomNumberGeneratorBetween(int lowerLimit, int upperLimit){
        return rand.nextInt((upperLimit-lowerLimit)+1) + lowerLimit;
    }

    public String randomAlphaNumericGeneratorSetLength(int length) {
        return RandomStringUtils.randomAlphanumeric(length);
    }

    public String randomAlphaNumericGeneratorRandomLength (int minLength, int maxLength){
        int length = randomNumberGeneratorBetween(minLength, maxLength);
        return RandomStringUtils.randomAlphanumeric(length);
    }

    public String randomStringGeneratorSetLength(int length) {
        return RandomStringUtils.randomAlphabetic(length);
    }

    public String randomStringGeneratorRandomLength (int minLength, int maxLength){
        int length = randomNumberGeneratorBetween(minLength, maxLength);
        return RandomStringUtils.randomAlphabetic(length);
    }

}
