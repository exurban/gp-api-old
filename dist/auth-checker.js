"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authChecker = void 0;
exports.authChecker = ({ context: { user } }, roles) => {
    console.log(`In authChecker ${JSON.stringify(user === null || user === void 0 ? void 0 : user.roles, null, 2)} is of type ${typeof (user === null || user === void 0 ? void 0 : user.roles)} has length ${user === null || user === void 0 ? void 0 : user.roles.length}`);
    if (roles.length === 0) {
        return user !== undefined;
    }
    if (!user) {
        return false;
    }
    if (user.roles.some((role) => roles.includes(role))) {
        console.log(`Checking role: ${roles}`);
        return true;
    }
    return false;
};
//# sourceMappingURL=auth-checker.js.map