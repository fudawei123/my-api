#include <iostream>
using namespace std;
enum class SimpleVariantType {
    Int,
    Double,
    String
};
class SimpleVariant {
public:
    SimpleVariant(int value) : type(SimpleVariantType::Int) { data.intValue = value; }
    SimpleVariant(double value) : type(SimpleVariantType::Double) { data.doubleValue = value; }
    SimpleVariant(const std::string& value) : type(SimpleVariantType::String) {
        data.stringValue = new std::string(value);
    }
    ~SimpleVariant() {
        if (type == SimpleVariantType::String) {
            delete data.stringValue;
        }
    }
    SimpleVariantType getType() const {
        return type;
    }
    int toInt() const {
        if (type == SimpleVariantType::Int) {
            return data.intValue;
        }
        return 0;
    }
    double toDouble() const {
        if (type == SimpleVariantType::Double) {
            return data.doubleValue;
        }
        return 0.0;
    }
    std::string toString() const {
        if (type == SimpleVariantType::String) {
            return *data.stringValue;
        }
        return "";
    }
private:
    SimpleVariantType type;
    union {
        int intValue;
        double doubleValue;
        std::string* stringValue;
    } data;
};
int main() {
    SimpleVariant intVariant(42);
    SimpleVariant doubleVariant(3.14);
    SimpleVariant stringVariant(std::string("Hello, World!"));
    std::cout << "intVariant type: Int, value: " << intVariant.toInt() << std::endl;
    std::cout << "doubleVariant type: Double, value: " << doubleVariant.toDouble() << std::endl;
    std::cout << "stringVariant type: String, value: " << stringVariant.toString() << std::endl;
    return 0;
}
