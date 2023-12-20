class PropertyValidator:
    def __init__(self, properties: dict, expected_keys: [str], exception_keys: [str] = None):
        self.raw_properties: dict = properties
        self.expected_keys: [str] = expected_keys
        self.properties: dict = {}
        self.exceptions: [str] = exception_keys or []
        self.valid = None
        
    def validate_property(self, key: str):
        raw_value: str = self.raw_properties.get(key)
        if not raw_value and key not in self.exceptions:
            self.valid = False
        elif not raw_value and key in self.exceptions:
            return None
        else:
            return str(raw_value).title()
    
    def get_validated_values(self):
        self.valid = True
        for key in self.expected_keys:
            self.properties[key] = self.validate_property(key)
        return self.properties, self.valid