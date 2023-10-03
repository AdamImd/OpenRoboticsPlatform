var input_square_num = 0;

var input_square = class input_square_class{
    constructor(size, new_frame = false){
        var self = this;
        this.size = size;
        
        var con;
        if(new_frame || !($("run_console_" + input_square_num))) {
            con = document.createElement("div");
            $("run_windows").appendChild(con);
            con.setAttribute("id", "run_console_" + input_square_num);
            input_square_num += 1;
        } else {
            con = $("run_console_" + input_square_num);
        }
        
        con.setAttribute("class", "input_square");
        con.onmousedown = function (event) { self.enabled = true;};
        con.onmouseup = function (event) { self.enabled = false; };
        con.onmouseleave = function (event) { self.enabled = false; };
        con.onmousemove = function (event) { 
            self.x = ((+event.offsetX - self.size/2) / (self.size/2)); 
            self.y = ((-event.offsetY + self.size/2) / (self.size/2)); 
        };

        con.style.width = size + "px";
        con.style.height = size + "px";

        this.enabled = false;
        this.x = 0;
        this.y = 0;
    }

    get_position() {
        return [
            this.enabled ? this.x : 0, 
            this.enabled ? this.y : 0
        ];
    }
};