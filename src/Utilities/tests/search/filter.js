function constructorMockImplementation(options) {
    this.name = options.name ?? null;
    this.join = options.join ?? null;
    this.operator = options.operator ?? null;
    this.values = options.values ?? null;
    this.summary = options.summary ?? null;
    this.formula = options.formula ?? null;
}

export {
    constructorMockImplementation
}