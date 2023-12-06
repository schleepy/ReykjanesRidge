namespace ReykjanesRidge.Server.Shared
{
    public class FomRangeSliderEventArgs : EventArgs
    {
        public int Range { get; set; }
        public int FirstValue { get; set; }
        public int SecondValue { get; set; }
    }
}
