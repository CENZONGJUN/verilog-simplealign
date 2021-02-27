// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { sign } from 'crypto';
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
	let reg_port = /^\s*(input|output|inout|parameter)/;
	let reg_declaration = /^\s*(wire|reg|integer|localparam)/;
	let reg_inscance = /^\s*\./;
	
	let new_line = line;

	// extract comment
	let comments = /(\/\/.*)?$/.exec(line)
	if (comments) {
		var line_no_comments = line.replace(comments[0], "")
		var comment = comments[0]
	}
	else {
		var line_no_comments = line
		var comment = ""
	}
	
	
	//let comment = line.replace(/^(.*)(\/\/.*)?$/, '\$2')

	if (reg_port.test(line)) {
		// Is port 
		// s1 original string
		new_line = line_no_comments.replace(/^\s*(input|output|inout|parameter)\s*(reg|wire)?\s*(signed)?\s*(\[.*\])?\s*([^;]*\b)\s*(,|;)?.*$/,
			function (s1, output, reg, signed, bound, name, comma) {
				let output_width = 7
				let reg_width = 5

				// align paremeter with output reg
				// paremeter..  
				// output reg.
				if (/parameter/.test(output)) {
					output = output.padEnd(output_width + reg_width)
					reg = ""
				}
				else {
					output = output.padEnd(output_width);
					if (reg != undefined)
						reg = reg.padEnd(reg_width);
					else
						reg = "".padEnd(reg_width);
				}


				
				if (signed != undefined)
					signed = signed.padEnd(7)
				else 
					signed = "       "

				if (bound != undefined) 
					bound = parseBound(bound).padEnd(17)
				else
					bound = "".padEnd(17)
				
				name = name.trim().padEnd(27)

				if (comma == undefined)
					comma = " "
				
				if (comment == undefined)
					comment = ""

				return "".padEnd(4) + output + reg + signed + bound + name + comma + comment;
				//....output.reg..signed.[...7:0].dout....................,//
			}
		);
	}
	else if (reg_declaration.test(line)) {
		// Is declaration
		// s1 orignial string
		new_line = line_no_comments.replace(/^\s*(wire|reg|localparam)\s*(signed)?\s*(\[.*\])?\s*(.*)\s*;.*$/,
			(s1, wire, signed, bound, name) => {
				wire = wire.padEnd(16);
				if (signed != undefined)
					signed = signed.padEnd(7)
				else 
					signed = "       "
				
				if (bound != undefined) 
					bound = parseBound(bound).padEnd(17)
				else
					bound = "".padEnd(17)
				
				name = name.trim().padEnd(27)
					
				if (comment == undefined)
					comment = ""
				
				return wire + signed + bound + name + ";" + comment
				//wire            signed [   1:0] a                          ;// a
			}
		);
	}
	else if (reg_inscance.test(line)) {
		// Is instance
		new_line = line_no_comments.replace(/^\s*\.\s*(\w*)\s*\((.*)\)\s*(,)?.*$/,
			(s1, port_name, signal_name, comma) => {
				port_name = port_name.padEnd(34)
				if (signal_name)
					signal_name = signal_name.trim().padEnd(26)
				else
					signal_name = "".padEnd(26)

				if (comma == undefined)
					comma = " "
				if (comment == undefined)
					comment = ""				
				return "    ." + port_name + "(" + signal_name + ")" + comma + comment
				
			}
		);
	}
	else if (line_no_comments.trim().length > 0) {
		// align the comments
		line_no_comments = line_no_comments.replace(/\t/g, "".padEnd(4))
		line_no_comments = line_no_comments.trimEnd()
		if (comment.length > 0)
			line_no_comments = line_no_comments.padEnd(68)
		new_line = line_no_comments + comment
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
