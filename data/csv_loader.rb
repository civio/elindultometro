# encoding: utf-8

module CSVLoader
  # Handle parsing of input files in a Ruby 1.8 backwards-compatible way 
  def self.parseCSV(filename)
    require 'csv'
    if CSV.const_defined? :Reader # 1.8
      FasterCSV.foreach(filename) do |line|
        yield(line)
      end
    else # 1.9
      CSV.foreach(filename) do |line|
        yield(line)
      end
    end
  end
end