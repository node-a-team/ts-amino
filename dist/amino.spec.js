"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var big_integer_1 = __importDefault(require("big-integer"));
// tslint:disable-next-line: no-implicit-dependencies
require("mocha");
var amino_1 = require("./amino");
var type_1 = require("./type");
// tslint:disable: no-console
// tslint:disable: max-classes-per-file
var Test = /** @class */ (function () {
    function Test() {
        this.int64 = big_integer_1.default(4230802);
        this.uint16 = 10;
    }
    __decorate([
        amino_1.Field.Int64(0, {
            jsonName: "test"
        })
    ], Test.prototype, "int64", void 0);
    __decorate([
        amino_1.Field.Uint16()
    ], Test.prototype, "uint16", void 0);
    Test = __decorate([
        amino_1.Concrete("test"),
        amino_1.DefineStruct()
    ], Test);
    return Test;
}());
var Test2 = /** @class */ (function () {
    function Test2() {
        this.test = new Test();
    }
    __decorate([
        amino_1.Field.Defined()
    ], Test2.prototype, "test", void 0);
    Test2 = __decorate([
        amino_1.Concrete("concrete-with-struct"),
        amino_1.DefineStruct()
    ], Test2);
    return Test2;
}());
var Test3 = /** @class */ (function () {
    function Test3() {
        this.test = new Test();
    }
    __decorate([
        amino_1.Field.Interface()
    ], Test3.prototype, "test", void 0);
    Test3 = __decorate([
        amino_1.Concrete("concrete-with-interface"),
        amino_1.DefineStruct()
    ], Test3);
    return Test3;
}());
var Test4 = /** @class */ (function () {
    function Test4() {
        this.test = new Definition();
    }
    __decorate([
        amino_1.Field.Defined()
    ], Test4.prototype, "test", void 0);
    Test4 = __decorate([
        amino_1.Concrete("concrete-with-deep-definition"),
        amino_1.DefineStruct()
    ], Test4);
    return Test4;
}());
var Definition = /** @class */ (function () {
    function Definition() {
        this.test = "should not visibile";
    }
    Definition.prototype.marshalAmino = function () {
        return "test";
    };
    __decorate([
        amino_1.Field.String()
    ], Definition.prototype, "test", void 0);
    __decorate([
        amino_1.Method.AminoMarshaler({ type: type_1.Type.String })
    ], Definition.prototype, "marshalAmino", null);
    Definition = __decorate([
        amino_1.DefineType()
    ], Definition);
    return Definition;
}());
describe("Test amino", function () {
    it("test decorator", function () {
        var test = new Test();
        var bz = amino_1.marshalBinaryBare(test);
        assert.equal(Buffer.from(bz).toString("hex"), "81884c7d08929d8202100a");
        assert.equal(amino_1.marshalJson(test), "{\"type\":\"test\",\"value\":{\"test\":\"4230802\",\"uint16\":10}}");
    });
    it("test concrete with struct", function () {
        var test = new Test2();
        var bz = amino_1.marshalBinaryBare(test);
        assert.equal(Buffer.from(bz).toString("hex"), "43e99ea80a0708929d8202100a");
        assert.equal(amino_1.marshalJson(test), "{\"type\":\"concrete-with-struct\",\"value\":{\"test\":{\"test\":\"4230802\",\"uint16\":10}}}");
    });
    it("test concrete with interface", function () {
        var test = new Test3();
        var bz = amino_1.marshalBinaryBare(test);
        assert.equal(Buffer.from(bz).toString("hex"), "f0de397d0a0b81884c7d08929d8202100a");
        assert.equal(amino_1.marshalJson(test), "{\"type\":\"concrete-with-interface\",\"value\":{\"test\":{\"type\":\"test\",\"value\":{\"test\":\"4230802\",\"uint16\":10}}}}");
    });
    it("test concrete with deep definition", function () {
        var test = new Test4();
        var bz = amino_1.marshalBinaryBare(test);
        assert.equal(Buffer.from(bz).toString("hex"), "e456c43f0a0474657374");
        assert.equal(amino_1.marshalJson(test), "{\"type\":\"concrete-with-deep-definition\",\"value\":{\"test\":\"test\"}}");
    });
});
//# sourceMappingURL=amino.spec.js.map