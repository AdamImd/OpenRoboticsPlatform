var key_input = class key_input_class{
    constructor(){
        var self = this;
        this.keys = {};
        document.addEventListener('keydown', function(event) {
            self.keys[event.key] = true;
        });
        document.addEventListener('keyup', function(event) {
            self.keys[event.key] = false;
        });
    }
    
    key_pressed(key){
        return this.keys[key];
    }
}