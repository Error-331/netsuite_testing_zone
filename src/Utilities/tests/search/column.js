function constructorMockImplementation(options) {
    this.name = options.name ?? null;
    this.join = options.join ?? null;
    this.summary = options.summary ?? null;
    this.formula = options.formula ?? null;
    this.label = options.label ?? null;
    this.sort = options.sort ?? null;
}

export {
    constructorMockImplementation
}