package com.example.budgettracker.controller;

import org.xml.sax.ErrorHandler;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;
import org.springframework.stereotype.Controller;

@Controller
public class CustomErrorController implements ErrorHandler {

    @Override
    public void warning(SAXParseException exception) throws SAXException {
        // Handle warnings here
        System.err.println("Warning: " + exception.getMessage());
    }

    @Override
    public void error(SAXParseException exception) throws SAXException {
        // Handle recoverable errors here
        System.err.println("Error: " + exception.getMessage());
    }

    @Override
    public void fatalError(SAXParseException exception) throws SAXException {
        // Handle fatal errors here
        System.err.println("Fatal Error: " + exception.getMessage());
        throw exception; // Rethrow if you want to stop processing
    }
}
