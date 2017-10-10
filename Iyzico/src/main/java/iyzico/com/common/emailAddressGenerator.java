package main.java.iyzico.com.common;

/**
 * Created by seday on 18/08/16.
 */
public class emailAddressGenerator {
    randomGenerator randomGenerator = new randomGenerator();

    int minEmailLocalLengthAllowed = 1;
    int maxEmailLocalLengthAllowed = 64;
    int maxEmailLengthAllowed = 254;

    public String validEmailGenerator() {
        return randomGenerator.randomAlphaNumericGeneratorRandomLength(2,10) + "@" +
                randomGenerator.randomAlphaNumericGeneratorRandomLength(2,10) + ".com";
    }

    public String validRandomEmailGeneratorSetLength(int localLength, int domainLength) {
        return randomGenerator.randomAlphaNumericGeneratorSetLength(localLength) + "@" +
                randomGenerator.randomAlphaNumericGeneratorSetLength(domainLength) + "." + "com";
    }

    public String randomInvalidEmailGeneratorWithNoAtSign() {
        // TODO refactor the hard coded part // 4 is for ".com"
        return randomGenerator.randomAlphaNumericGeneratorRandomLength(minEmailLocalLengthAllowed, maxEmailLengthAllowed-4) + ".com";
    }

    public String randomInvalidEmailGeneratorWithNoDomain() {
        return randomGenerator.randomAlphaNumericGeneratorRandomLength(minEmailLocalLengthAllowed-4, maxEmailLengthAllowed-4) + "@";
    }

    public String randomInvalidEmailGeneratorLargerThanMaxLengthAllowed(){
        return randomGenerator.randomAlphaNumericGeneratorSetLength(255);
    }

    // TODO localLength ve domainLength inputlarinin toplaminin 254'ten buyuk olma durumu handle edilmedi
    // TODO handle diffrent domain name possibilities /.co /.com /.co.uk etc.

}
