package com.example.CrowdFunding;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CrowdFundingApplication {

	public static void main(String[] args) {
		SpringApplication.run(CrowdFundingApplication.class, args);
	}

}
