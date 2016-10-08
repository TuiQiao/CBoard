package org.cboard.controller;


import org.cboard.dto.User;
import org.cboard.services.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by yfyuan on 2016/7/25.
 */
@RestController
@RequestMapping("/commons")
public class CommonsController {

    @Autowired
    private AuthenticationService authenticationService;

    @RequestMapping(value = "/getUserDetail")
    public User getUserDetail() {
        return authenticationService.getCurrentUser();
    }
}
