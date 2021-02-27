# verilog-simplealign

This extension can align verilog lines in a simple way.  
## Features
key binding: CTRL+L

* input,output,inout,parameter
* wire,reg,localparam
* .dout(dout)

demo:
``` verilog
module demo #(
    parameter                           p = 0                       
)(
    output                              dout0                      ,
    output reg                          dout1                      ,
    output reg         [1023:0]         dout2                      ,
    output reg         [   7:0]         dout3                      ,
    output reg  signed [   7:0]         dout4                      ,// comment  output reg signed [7:0] dout4,
    input                               din0                       ,
    input  wire                         clk                        ,// clk
    input  wire                         rst                         // rst
);
wire            signed [   1:0]         a                          ;// a
localparam             [1996:0]         b                          ;// b
reg                    [   3:0]         c = 0                      ;// c
wire                                    tmpa                       ;
wire                                    tmpbb                      ;

A u_A (
    .din                               (CpSl_din[10 : 0]          ),//din
    .dout                              (CpSl_dout                 ) 
);

endmodule
```
``` verilog
module demo #(
 parameter p = 0 
)(
 output dout0 ,
 output reg dout1,
 output reg [1023:0] dout2,
 output reg [7:0] dout3,
 output reg signed [7:0] dout4, // comment  output reg signed [7:0] dout4,
 input din0,
 input wire clk ,// clk
 input wire rst // rst
);
wire signed [ 1:0] a ;// a
localparam [1996:0] b ;// b
reg [ 3:0] c = 0 ;// c
wire tmpa ;
wire tmpbb ;

A u_A (
 .din (CpSl_din[10 : 0] ),//din
 .dout (CpSl_dout ) 
);

endmodule
```



## Acknowledgment
Seongmock Yoo: https://github.com/seongmock/verilog-autoline


