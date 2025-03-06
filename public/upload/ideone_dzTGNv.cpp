#include <iostream>
#include <cassert>
// #include <vector>
using namespace std;

class A
{
public:
	int m_x;
	A(int x = 0): m_x(x){cout << "A(" << x << ") " << this << endl;}
	~A(){cout << "~A() " << this << endl;}
	A(const A &a): m_x(a.m_x){cout << "A(const A &a) " << this << " " << &a << endl;}
	A(const A &&a){cout << "A(const A &&a)" << endl;}
	A& operator=(const A &a){cout << "A& operator=(const A &a) " << this << " " << &a << endl;return *this;}
	A& operator=(const A &&a){cout << "A& operator=(const A &&a) " << this << " " << &a << endl;return *this;}
};

template<class T>
class vector{
public:
	vector():_start(nullptr), _finish(nullptr), _end(nullptr){}
	vector(const vector<T> &v){
		reverse(v.capacity());
		for(auto &itm : v){
			push_back(itm);
		}
	}
	template<class InputIterator>
	vector(InputIterator first, InputIterator last){
		while(first != last){
			push_back(*first);
			first++;
		}
	}
	~vector(){
		for(size_t i=0;i<size();i++){
			 _start[i].~T();
		}
		operator delete (_start);
		_start = _finish = _end = nullptr;
	}
	typedef T* iterator;
	typedef const T* const_iterator;
	iterator begin(){
		return _start;
	}
	iterator end(){
		return _finish;
	}
	iterator begin() const {
		return _start;
	}
	iterator end() const {
		return _finish;
	}
	size_t size() const {
		return _finish - _start;
	}
	size_t capacity() const {
		return _end - _start;
	}
	void reverse(size_t n){
		if(_end - _start < n){
			T *temp = (T*)(operator new (n * sizeof(T)));
			size_t oldn = size();
			for(size_t i=0;i<oldn;i++){
				new (temp+i) T(_start[i]); 
			}
			// T *temp = new T[n];
			// for(size_t i=0;i<oldn;i++){
			// 	temp[i] = _start[i]; 
			// }
			operator delete (_start);
			_start = temp;
			_finish = _start + oldn;
			_end = _start + n;
		}
	}
	iterator insert(iterator pos, const T &val){
		assert(pos >= _start && pos <= _finish);
		if(_finish == _end){
			size_t n = pos - _start;
			reverse(capacity() == 0 ? 4 : capacity() * 2);
			pos = _start + n;
		}
		iterator cur = _finish;
		while(cur > pos){
			*cur = *(cur-1);
			cur--;
		}
		new (pos) T(val); 
		// *pos = val;
		_finish++;
		return pos;
	}
	void push_back(const T &val){
		insert(_finish, val);
	}
	iterator erase(iterator pos){
		assert(pos >= _start && pos <= _finish);
		iterator cur = pos;
		while(cur != _finish-1){
			*cur = *(cur+1);
			cur++;
		}
		_finish--;
		return pos;
	}
	void pop_back(){
		erase(_finish - 1);
	}
	void swap(vector<T> &v){
		std::swap(_start, v._start);
		std::swap(_finish, v._finish);
		std::swap(_end, v._end);
	}
	T& operator[](size_t pos){
		assert(pos >=0 && pos <= size());
		return _start[pos];
	}
	T& operator[](size_t pos) const {
		assert(pos >=0 && pos <= size());
		return _start[pos];
	}
private:
	iterator _start = nullptr;
	iterator _finish = nullptr;
	iterator _end = nullptr;
};
void print(vector<A> &v){
	for(auto &a : v){
		cout << a.m_x << endl;
	}
}
int main() {
	vector<A> v1;
	vector<A> v2;
	A a1(1);
	A a2(2);
	A a3(3);
	A a4(4);
	cout << "--------------" << endl;
	v1.push_back(a1);
	v2.push_back(a2);
	v2.push_back(a3);
	cout << "--------------" << endl;
	v1.swap(v2);
	print(v1);
	print(v2);
	cout << "--------------" << endl;
	vector<A> v3(v1);
	print(v3);
	cout << "--------------" << endl;
	vector<A> v4(v3.begin(), v3.end());
	v4.push_back(a4);
	print(v4);
	cout << "--------------" << endl;
	return 0;
}