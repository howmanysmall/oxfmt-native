use std::{
	env,
	io::{self, Read},
};

use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;

fn main() {
	let arguments: Vec<String> = env::args().collect();
	if arguments.len() < 2 {
		eprintln!("Usage: oxfmt-native <file-name>");
		std::process::exit(1);
	}

	let file_name = &arguments[1];
	let mut source_text = String::new();

	if let Err(error) = io::stdin().read_to_string(&mut source_text) {
		eprintln!("Failed to read stdin: {}", error);
		std::process::exit(1);
	}

	let allocator = Allocator::default();
	let source_type = SourceType::from_path(file_name).unwrap_or_default();

	let parsed = Parser::new(&allocator, &source_text, source_type)
		.with_options(ParseOptions::default())
		.parse();

	if !parsed.errors.is_empty() {
		for error in parsed.errors {
			eprintln!("{:?}", error);
		}
		std::process::exit(1);
	}

	let formatted = Codegen::new()
		.with_options(CodegenOptions::default())
		.build(&parsed.program)
		.code;

	print!("{}", formatted);
}
