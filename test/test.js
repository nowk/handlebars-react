"use strict";
var compiler = require("../lib");
var options  = require("../lib/parseOptions");

var chai = require("chai");
var expect = chai.expect;

chai.use( require("chai-as-promised") );



// https://facebook.github.io/react/jsx-compiler.html



describe("Basic HTML", () =>
{
	describe("with one top-level node", () =>
	{
		it("should be supported", () =>
		{
			var result = new compiler( options() ).compile('<tag></tag>');
			var expectedResult = 'React.createElement("tag")';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support an attribute", () =>
		{
			var result = new compiler( options() ).compile('<tag attr="value"></tag>');
			var expectedResult = 'React.createElement("tag",{"attr":"value"})';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support attributes", () =>
		{
			var result = new compiler( options() ).compile('<tag attr1="value1" attr-2="value2"></tag>');
			var expectedResult = 'React.createElement("tag",{"attr1":"value1","attr-2":"value2"})';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support attributes and text content", () =>
		{
			var result = new compiler( options() ).compile('<tag attr1="value1" attr-2="value2">text</tag>');
			var expectedResult = 'React.createElement("tag",{"attr1":"value1","attr-2":"value2"},"text")';
			
			//console.log( require("uglify-js").minify(result,{fromString:true}).code );
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support nested tags", () =>
		{
			var result = new compiler( options() ).compile('<tag><tag></tag>text<tag></tag></tag>');
			var expectedResult = 'React.createElement("tag",null,React.createElement("tag"),"text",React.createElement("tag"))';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support nested tags (#2)", () =>
		{
			var result = new compiler( options() ).compile('<tag>text<tag></tag>text</tag>');
			var expectedResult = 'React.createElement("tag",null,"text",React.createElement("tag"),"text")';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support nested tags and a convenience function", () =>
		{
			var result = new compiler( options({ useDomMethods:true }) ).compile('<div><tag></tag>text<tag></tag></div>');
			var expectedResult = 'React.DOM.div(null,React.createElement("tag"),"text",React.createElement("tag"))';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support nested tags and a convenience function (#2)", () =>
		{
			var result = new compiler( options({ useDomMethods:true }) ).compile('<div>text<tag></tag>text</div>');
			var expectedResult = 'React.DOM.div(null,"text",React.createElement("tag"),"text")';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support nested tags and a convenience function (#3)", () =>
		{
			var result = new compiler( options({ useDomMethods:true }) ).compile('<div><div>text</div><tag>text</tag></div>');
			var expectedResult = 'React.DOM.div(null,React.DOM.div(null,"text"),React.createElement("tag",null,"text"))';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
	});
	
	
	
	// NOTE :: this is not supported by React, but it's here for completeness
	describe("with multiple top-level nodes", () =>
	{
		it("should be supported", () =>
		{
			var result = new compiler( options({ multipleTopLevelNodes:true }) ).compile('<tag></tag><tag></tag>');
			var expectedResult = '[React.createElement("tag"),React.createElement("tag")]';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support attributes and text content", () =>
		{
			var result = new compiler( options({ multipleTopLevelNodes:true }) ).compile('<tag attr="value">text</tag> <tag attr1="value1" attr-2="value2">text</tag>');
			var expectedResult = '[React.createElement("tag",{"attr":"value"},"text")," ",React.createElement("tag",{"attr1":"value1","attr-2":"value2"},"text")]';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support nested tags", () =>
		{
			var result = new compiler( options({ multipleTopLevelNodes:true, useDomMethods:true }) ).compile('<tag><tag></tag>text<tag></tag></tag> <tag>text<tag></tag>text</tag>');
			var expectedResult = '[React.createElement("tag",null,React.createElement("tag"),"text",React.createElement("tag"))," ",React.createElement("tag",null,"text",React.createElement("tag"),"text")]';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support nested tags and a convenience function", () =>
		{
			var result = new compiler( options({ multipleTopLevelNodes:true, useDomMethods:true }) ).compile('<div><tag></tag>text<tag></tag></div> <div>text<tag></tag>text</div>');
			var expectedResult = '[React.DOM.div(null,React.createElement("tag"),"text",React.createElement("tag"))," ",React.DOM.div(null,"text",React.createElement("tag"),"text")]';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
	});
	
	
	
	describe("edge cases", () =>
	{
		it("should support text content with special characters", () =>
		{
			var result = new compiler( options() ).compile('<tag>"text©&copy;&nbsp;"</tag>');
			var expectedResult = 'React.createElement("tag",null,"\\\"text©© \\\"")';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support <script> tags", () =>
		{
			var result = new compiler( options() ).compile('<script>function a(arg){ b(arg,"arg") }</script>');
			var expectedResult = 'React.createElement("script",null,"function a(arg){ b(arg,\\\"arg\\\") }")';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support unrecognized <script> tags", () =>
		{
			var result = new compiler( options() ).compile('<script type="text/template"><tag attr=\"value\">text</tag></script>');
			var expectedResult = 'React.createElement("script",{"type":"text/template"},"<tag attr=\\\"value\\\">text</tag>")';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support <style> tags", () =>
		{
			var result = new compiler( options() ).compile('<style>html { background-color:gray }</style>');
			var expectedResult = 'React.createElement("style",null,"html { background-color:gray }")';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("should support style attributes", () =>
		{
			var result = new compiler( options() ).compile('<div style="background-color:gray"></div>');
			var expectedResult = 'React.createElement("div",{"style":{"backgroundColor":"gray"}})';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
	});
	
	
	
	describe("options", () =>
	{
		it("beautify = true", () =>
		{
			var result = new compiler( options({ beautify:true }) ).compile('<tag attr1="value1" attr-2="value2">text</tag>');
			
			var expectedResult = '';
			expectedResult += 'React.createElement("tag", {\n';
			expectedResult += '  attr1: "value1",\n';
			expectedResult += '  "attr-2": "value2"\n';
			expectedResult += '}, "text");';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("normalizeWhitespace = true", () =>
		{
			var result = new compiler( options({ normalizeWhitespace:true }) ).compile('<tag>text©&copy; &nbsp;  </tag>');
			var expectedResult = 'React.createElement("tag",null,"text©©   ")';  // non-breaking space remains
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("processCSS = true", () =>
		{
			var result = new compiler( options({ processCSS:true }) ).compile('<style>\ndiv\n{\n\tproperty: value;\n}\n</style>');
			var expectedResult = 'React.createElement("style",null,"div{property:value}")';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		it("processJS = true", () =>
		{
			var result = new compiler( options({ processJS:true }) ).compile('<script>\nfunction funcA (arg)\n{\n\tfuncB(arg, "arg");\n}\n</script>');
			var expectedResult = 'React.createElement("script",null,"function funcA(n){funcB(n,\\\"arg\\\")}")';
			
			return expect(result).to.eventually.deep.equal(expectedResult);
		});
		
		
		
		// `multipleTopLevelNodes` is tested above
		// `useDomMethods` is tested above
	});
});
