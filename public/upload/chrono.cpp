#include <iostream>
using namespace std;
template <size_t STEP = 1>
class ratio
{
public:
    size_t step = STEP;
};
namespace heheda
{
    namespace chrono
    {
        template <class Rep, class Period = ratio<1>>
        class duration
        {
        public:
            Rep rep;
            Period period;
            size_t m_num;
            duration(size_t num) : m_num(num) {}
            size_t count()
            {
                return period.step * m_num;
            }
        };
        using minutes = duration<int, ratio<60>>;
    }
}
int main()
{
    heheda::chrono::duration<int, ratio<60>> a(3);
    cout << a.count() << endl;
    heheda::chrono::minutes b(10);
    cout << b.count() << endl;
    return 0;
}
