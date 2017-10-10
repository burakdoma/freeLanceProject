package main.java.iyzico.com.common;

import java.util.Random;

/**
 * Created by burakdoma on 22/08/16.
 */
public class phoneNumberGenerator {
    Random rand = new Random();

    public String validPhoneNumberGenerator(){
        String firstDigit = "5";
        int phoneNumberDigit = 10;
        int counter = 0;
        String number = "";
        while (counter < (phoneNumberDigit-1)) {
            int randNumber = rand.nextInt(9);
            number = number + Integer.toString(randNumber);
            counter++;
        }
        number = firstDigit+number;
        return number;
        }

    public String invalidPhoneNumberGenerator(){
        String number =validPhoneNumberGenerator();
        number = number + Integer.toString(rand.nextInt(9));
        return number;
    }
}

// Phone Number alani validity check yok, o yuzden farkli tur invalid phone number'lar test edilmedi