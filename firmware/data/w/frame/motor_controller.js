var driver = class driver_class {
    constructor(motor1_enable, motor1_D1, motor1_D2, motor2_enable, motor2_D1, motor2_D2, enable = true){
        this.m1_e = motor1_enable;
        this.m1_d1 = motor1_D1;
        this.m1_d2 = motor1_D2;
        this.m1_inv = false;
        this.m2_e = motor2_D1;
        this.m2_d1 = motor2_D2;
        this.m2_d2 = motor2_enable;
        this.m2_inv = false;
        this.e = enable; // TODO: Actually disable

        digital_write_command([[this.m1_e, 0], [this.m1_d1, 0], [this.m1_d2, 0], 
            [this.m2_e, 0], [this.m2_d1, 0], [this.m2_d2, 0]]);
        pin_mode_command([[this.m1_e, OUTPUT], [this.m1_d1, OUTPUT], [this.m1_d2, OUTPUT], 
            [this.m2_e, OUTPUT], [this.m2_d1, OUTPUT], [this.m2_d2, OUTPUT]]);
    }

    invert_motor(motor1_invert, motor2_invert){
        this.m1_inv = motor1_invert;
        this.m2_inv = motor2_invert;
    }

    set_speeds(motor1_speed, motor2_speed){ // Inputs: -1.00 - 1.00
        let m1_dir = (motor1_speed > 0) != this.m1_inv ? [this.m1_d1, this.m1_d2] : [this.m1_d2, this.m1_d1];
        let m2_dir = (motor2_speed > 0) != this.m2_inv ? [this.m2_d1, this.m2_d2] : [this.m2_d2, this.m2_d1];
        analog_write_command([[this.m1_e, parseInt(Math.abs(motor1_speed) * 1024)], 
             [this.m2_e, parseInt(Math.abs(motor2_speed) * 1024)]]);
        digital_write_command([[m1_dir[0], 0], [m1_dir[1], 1], 
           [m2_dir[0], 0], [m2_dir[1], 1]]);
    }
}
