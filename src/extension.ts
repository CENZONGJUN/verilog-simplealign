// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function parseBound(bound: string): string {
	//[7:0] => [   7:0]
	bound = bound.replace(/\[\s*(\d*)\s*:\s*0.*/, (s1, upbound) => {
		upbound = upbound.padStart(4);
		return "[" + upbound + ":0]";
	});
	return bound
}

function parseLine(line: string): string {
	let types = ['port', 'declaeration', 'instance'];

	// regular expression to determin type
	// One can easily test them with VSCode: ctrl+f, alt+r
	let reg_port = /^\s*input|output|inout/;
	let reg_declaration = /^\s*wire|reg|integer|localparam|parameter/;
	let reg_inscance = /^\s*\./;
	
	let new_line = line;

	if (reg_port.test(line)) {
		// Is port 
		// s1 original string
		new_line = line.replace(/^\s*(input|output|inout)\s*(reg|wire)?\s*(signed)?\s*(\[.*\])?\s*(\w*)\s*(,)?\s*(\/\/.*)?$/,
			function (s1, output, reg, signed, bound, name, comma, comment) {
				output = output.padEnd(7);

				if (reg != undefined)
					reg = reg.padEnd(5);
				else
					reg = "".padEnd(5);
				
				if (signed != undefined)
					signed = signed.padEnd(7)
				else 
					signed = "       "

				if (bound != undefined) 
					bound = parseBound(bound).padEnd(17)
				else
					bound = "".padEnd(17)
				
				name = name.padEnd(27)

				if (comma == undefined)
					comma = " "
				
				if (comment == undefined)
					comment = ""

				return "".padEnd(4) + output + reg + signed + bound + name + comma + comment;
				//    output reg  signed [   7:0] dout                      ,//
			}
		);
	}
	else if (reg_declaration.test(line)) {
		// Is declaration
		// s1 orignial string
		new_line = line.replace(/^\s*(wire|reg|localparam)\s*(signed)?\s*(\[.*\])?\s*(.*);\s*(\/\/.*)?$/,
			(s1, wire, signed, bound, name, comment) => {
				wire = wire.padEnd(16);
				if (signed != undefined)
					signed = signed.padEnd(7)
				else 
					signed = "       "
				
				if (bound != undefined) 
					bound = parseBound(bound).padEnd(17)
				else
					bound = "".padEnd(17)
				
				name = name.padEnd(27)
					
				if (comment == undefined)
					comment = ""
				
				return wire + signed + bound + name + ";" + comment
				//wire            signed [   1:0] a                          ;// a
			}
		);
	}
	else if (reg_inscance.test(line)) {
		// Is instance
		new_line = line.replace(/^\s*\.\s*(\w*)\s*\(\s*(\S.*\S)\s*\)\s*(,)?(\/\/.*)?$/,
			(s1, port_name, signal_name, comma,comment) => {
				port_name = port_name.padEnd(34)
				signal_name = signal_name.padEnd(26)
				if (comma == undefined)
					comma = " "
				if (comment == undefined)
					comment = ""				
				return "    ." + port_name + "(" + signal_name + ")" + comma + comment
				
			}
		);
	}


	return new_line;
}

// Command excution function
function simpleAlign() {
	var editor = vscode.window.activeTextEditor;
	if (!editor)
		return
	let fileName = editor.document.fileName;
	if (!(fileName.endsWith(".v") || fileName.endsWith(".sv")))
		return

	let sel = editor.selection; // Handle only one selection

	editor.edit(
		(builder) => {
			for (let i = sel.start.line; i <= sel.end.line; i++){
				// process line by line
				if (!editor)
					continue
				let line = editor.document.lineAt(i);
				let new_line = parseLine(line.text);

				if (new_line.localeCompare(line.text) != 0) {
					let line_range = new vscode.Range(line.range.start, line.range.end);
					builder.replace(line_range, new_line);
				}
			}
		}
	);

	// Display a message box to the user
	//vscode.window.showInformationMessage('Hello World from verilog-simplealign!');
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Congratulations, your extension "verilog-simplealign" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('verilog-simplealign.simple_align', simpleAlign);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
